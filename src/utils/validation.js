export const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
export const priorities = ['Low', 'Medium', 'High', 'Critical'];
export const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'];
export function validateFile(file) {
  if (!allowedTypes.includes(file.type)) throw new Error('Choose a PNG, JPEG, PDF, or plain-text file.');
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Files must be between 1 byte and 5 MB.');
}
export function issueTitle(value) {
  const title = value.trim();
  if (title.length < 3 || title.length > 160) throw new Error('Title must contain 3–160 characters.');
  return title;
}
