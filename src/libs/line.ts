"use server";
import { getServerSession } from "./session";

export const push = async (msg: string, token? : string) => {
  const params = new URLSearchParams();
  params.append('message', msg);

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    },
    body: params
  };

  return fetch('https://notify-api.line.me/api/notify', requestOptions);
};
