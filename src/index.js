import { defineChildren } from 'alemonjs'
import responseRouter from './router.js'

export default defineChildren({
  register() {
    return { responseRouter }
  }
})
