
import { getNoticeInvoice } from "@/services/invoice";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const invoices = await getNoticeInvoice(Number(id));
  const data = {
    invoice: invoices.state ? (
      invoices.data.filter(i => (i.status == 0) || (i.status == 2 && dayjs().isAfter(dayjs(i.end).endOf('day')))).length > 0
    ) : false,
    canClose: invoices.state ? (
      invoices.data.filter((i => (i.status == 0 && dayjs().isBefore(dayjs(i.end).endOf('day'))))).length > 0
    ) : false
  }

  const createWarning = `
    const createContainer = () => {
      const container = document.createElement("div");
      container.style.display = "block";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.overflow = "hidden";
      container.style.position = "fixed";
      container.style.zIndex = 99999999999999;
      container.style.paddingTop = "100px";
      container.style.left = 0;
      container.style.top = 0;
      container.style.backgroundColor = "rgba(0, 0, 0, 0.4)";

      const content = document.createElement("div");
      content.style.margin = "auto";
      content.style.padding = "10px";
      content.style.boxSizing = "border-box";
      content.style.border = "1px solid #888";
      content.style.width = "65%";
      content.style.height = "80%";
      content.style.display = "flex";
      content.style.flexDirection = "column";
      content.style.backgroundColor = "#fefefe";

      const close = document.createElement("span");
      close.innerHTML = "&times;";
      close.style.color = "#e64e4e";
      close.style.fontSize = "5em";
      close.style.fontWeight = "bold";
      close.style.marginLeft = "auto";
      close.style.cursor = "pointer";

      const wrapper = document.createElement("div");
      wrapper.style.flexGrow = "1";

      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = 0;
      iframe.setAttribute(
        "src",
        \`${req.nextUrl.origin}/notice/${id}\`
      );
      iframe.setAttribute("scrolling", "no");

      close.onclick = () => {
        const date = new Date();
        document.cookie = \`__payment_delay=\${date.toISOString()}; path=/\`
        container.style.display = "none"
      }

      function reSm(x) {
        if (x.matches) { // If media query matches
          content.style.width = "100%";
          content.style.height = "100%";
          container.style.paddingTop = "0px";
        } else {
          content.style.width = "65%";
          content.style.height = "80%";
          container.style.paddingTop = "100px";
        }
      }

      var sm = window.matchMedia("(max-width: 900px)")

      reSm(sm); // Call listener function at run time
      sm.addEventListener("change", function() { reSm(sm); });

      wrapper.appendChild(iframe);
      content.appendChild(close);
      content.appendChild(wrapper);
      container.appendChild(content);

      return container
    }
  `;

  const createInvoice = `
    const createContainer = () => {
      const container = document.createElement("div");
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.overflow = "hidden";

      const iframe = document.createElement("iframe");
      iframe.style.zIndex = 999999;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = 0;
      iframe.style.left = 0;
      iframe.setAttribute("src", \`https://payment.flowmisite.com/notice/${id}\`);
      iframe.setAttribute('scrolling', 'no');

      container.appendChild(iframe)

      return container
    }
  `

  const script = `
    document.addEventListener("DOMContentLoaded", function () {
      ${
        !data.canClose ? (
          `
            ${createInvoice}
            const iframe = createContainer();
            document.body.appendChild(iframe);
          `
        ):(
          `
            ${createWarning}
            const getCookie = (cname) => {
              let name = cname + "=";
              let decodedCookie = decodeURIComponent(document.cookie);
              let ca = decodedCookie.split(';');
              for(let i = 0; i <ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                  c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                  return c.substring(name.length, c.length);
                }
              }
              return "";
            }

            const isDelay = getCookie('__payment_delay');
            const lastWarningDate = new Date(isDelay);
            const currentDate = new Date();
            const timeDifferenceInMilliseconds = currentDate.getTime()- lastWarningDate.getTime()
            const DayMilliseconds = timeDifferenceInMilliseconds - (24 * (60 * 60000));

            if (DayMilliseconds < 0) return;
            const modal = createContainer();
            document.body.appendChild(modal);
          `
        )
      }
    });
  `

  return new Response(data.invoice ? script : "", { status: 200, headers: { 'Content-Type': 'application/javascript' } });
}