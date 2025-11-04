// Toast hook using Sonner for beautiful notifications
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive" | "info" | "warning" | "loading"
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const options = {
      description: description,
    }

    switch (variant) {
      case "destructive":
        sonnerToast.error(title, options)
        break
      case "info":
        sonnerToast.info(title, options)
        break
      case "warning":
        sonnerToast.warning(title, options)
        break
      case "loading":
        sonnerToast.loading(title, options)
        break
      default:
        sonnerToast.success(title, options)
        break
    }
  }

  return { toast }
}

