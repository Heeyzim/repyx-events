export const generateUniqueId = () => Math.random().toString(36).substring(2)

export const isPromise = (fn: any): boolean => {
  if (fn instanceof Promise) return true
  return false
}
