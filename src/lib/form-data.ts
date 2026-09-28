/** 读取表单中的文本字段；字段缺失或是文件时返回空字符串。 */
export function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
