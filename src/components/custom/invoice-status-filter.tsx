import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { GridFilterInputValueProps, GridFilterOperator } from "@mui/x-data-grid";
import React from "react";

function FilterInvoiceStatusValue(props: GridFilterInputValueProps) {
  const { item, applyValue, focusElementRef } = props;

  const selectRef = React.useRef<HTMLSelectElement | null>(null);
  React.useImperativeHandle(focusElementRef, () => ({
    focus: () => {
      if (!selectRef.current) return;
      selectRef.current.focus();
    },
  }));

  const handleFilterChange = (event: SelectChangeEvent) => {
    applyValue({ ...item, value: event.target.value });
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        pl: '20px',
      }}
    >
      <FormControl fullWidth>
        <InputLabel>สถานะ</InputLabel>
        <Select
          ref={selectRef}
          value={item.value}
          onChange={handleFilterChange}
          variant="standard"
        >
          <MenuItem value={0}>รอกำหนดการ</MenuItem>
          <MenuItem value={1}>ชำระแล้ว</MenuItem>
          <MenuItem value={2}>กำลังรอตรวจสอบ</MenuItem>
          <MenuItem value={3}>กำลังดำเนินการ</MenuItem>
          <MenuItem value={4}>เลยกำหนด</MenuItem>
          <MenuItem value={-1}>ยกเลิกแล้ว</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}


const InvoiceStatusFilter: GridFilterOperator<any, number>[] = [
  {
    label: 'ประกอบด้วย',
    value: 'contain',
    getApplyFilterFn: (filterItem) => {
      if (!filterItem.field || !filterItem.value || !filterItem.operator) {
        return null;
      }
      return (value) => {
        return Number(value) >= Number(filterItem.value);
      };
    },
    InputComponent: FilterInvoiceStatusValue,
    InputComponentProps: { type: 'number' },
    getValueAsString: (value: number) => `${value}`,
  },
];

export default InvoiceStatusFilter