// Tiện ích cho link dự án Scratch (https://scratch.mit.edu/projects/123456789/)

export function scratchId(url: string): string | null {
  const m = url.match(/^https:\/\/scratch\.mit\.edu\/projects\/(\d+)/);
  return m ? m[1] : null;
}

export const scratchEmbedUrl = (id: string) => `https://scratch.mit.edu/projects/${id}/embed`;

export const scratchThumbUrl = (_id: string) => "/images/featured-scratch-project.svg";

// Tháng hiện tại theo giờ Việt Nam, dạng "2026-10"
export function monthKey(date: Date = new Date()): string {
  return new Date(date.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 7);
}
