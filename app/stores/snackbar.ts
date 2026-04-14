import { defineStore } from 'pinia'

interface SnackbarState {
  show: boolean
  message: string
  color: string
  timeout: number
}

export const useSnackbarStore = defineStore('snackbar', {
  state: (): SnackbarState => ({
    show: false,
    message: '',
    color: 'success',
    timeout: 3000,
  }),
  actions: {
    success(message: string) {
      this.message = message
      this.color = 'success'
      this.timeout = 3000
      this.show = true
    },
    error(message: string) {
      this.message = message
      this.color = 'error'
      this.timeout = 5000
      this.show = true
    },
    info(message: string) {
      this.message = message
      this.color = 'info'
      this.timeout = 3000
      this.show = true
    },
  },
})
