"use client"

import { useCallback } from "react"

export function useTemplate() {
  // Handle using a template - insert its content into the composer
  const handleUseTemplate = useCallback((template: any) => {
    if (!template?.content) return

    // Dispatch a custom event that the Composer can listen to
    const event = new CustomEvent("templateUsed", {
      detail: { template, content: template.content },
    })
    document.dispatchEvent(event)
  }, [])

  return { handleUseTemplate }
}
