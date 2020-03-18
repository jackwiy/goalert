import React, { ReactNode } from 'react'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import PickerUtils from '@date-io/luxon'

export default function PickersUtilsProvider(props: { children: ReactNode }) {
  return (
    <MuiPickersUtilsProvider utils={PickerUtils}>
      {props.children}
    </MuiPickersUtilsProvider>
  )
}
