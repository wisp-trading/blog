import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {format, parseISO} from "date-fns"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Format an ISO date string ("2026-03-10") to "Mar 10, 2026" */
export function formatDate(iso: string): string {
    return format(parseISO(iso), "MMM d, yyyy")
}
