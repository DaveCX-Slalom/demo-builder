import { ref } from 'vue'

const message = ref('')
const open = ref(false)

/** One shared snackbar for short confirmations ("3 deals moved to Discovery"). */
export function useToast() {
  return { message, open, toast(text: string) { message.value = text; open.value = true } }
}
