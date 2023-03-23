import qs from "qs";

export function parseFromData(formData: FormData) {
  return qs.parse(new URLSearchParams(formData as any).toString(), {
    strictNullHandling: true,
  }) as { [key: string]: string | null | undefined };
}
