import { AdminPanelSettingsTwoTone, ChatTwoTone, HistoryTwoTone, PaymentTwoTone, PeopleTwoTone, ReceiptLongTwoTone } from "@mui/icons-material";
import { ElementType } from "react";

export const navIcons = {
  'chart-pie': ChatTwoTone,
  'user': PeopleTwoTone,
  'history': HistoryTwoTone,
  'invoice': ReceiptLongTwoTone,
  'admin': AdminPanelSettingsTwoTone,
  'payment': PaymentTwoTone,
} as Record<string, ElementType>;