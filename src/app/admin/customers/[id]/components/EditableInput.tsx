import { Button, Input, Typography } from '@mui/material'
import React, { FC } from 'react'

interface Props {
  placeholder?: string
  value: string | number
  onChange: (value: string | number) => void
  type: "text" | "number"
}

const EditableInput: FC<Props> = ({ placeholder, value, onChange, type }) => {
  return (
    <Input
      
      placeholder={placeholder}
      value={value}
      type={type}
      inputProps={{ style: { textAlign: 'end' } }}
      onChange={(e) => onChange(e.target.value)}

      {...(type == "number" ? {
        min: 0
      } : {})}
    />
  )
}

export default EditableInput
