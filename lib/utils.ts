import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {format, parseISO} from "date-fns"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Format an ISO date string ("2026-03-10") to "Mar 10, 2026" */
export function formatDate(iso: string): string {
    if (!iso) {
        console.error('formatDate: Invalid date input:', iso)
        return 'Invalid Date'
    }

    try {
        const date = parseISO(iso)
        if (isNaN(date.getTime())) {
            console.error('formatDate: Unable to parse date:', iso)
            return 'Invalid Date'
        }
        return format(date, "MMM d, yyyy")
    } catch (error) {
        console.error('formatDate: Error parsing date:', iso, error)
        return 'Invalid Date'
    }
}
