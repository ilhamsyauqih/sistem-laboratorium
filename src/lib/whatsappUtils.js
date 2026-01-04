import { differenceInDays, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Calculate remaining days until due date
 * @param {string|Date} dueDate - The due date
 * @returns {number} Number of days remaining (negative if overdue)
 */
export function calculateRemainingDays(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    return differenceInDays(due, today);
}

/**
 * Determine if WhatsApp reminder button should be shown
 * @param {string} status - Loan status
 * @param {string|Date} dueDate - The due date
 * @returns {boolean} True if button should be visible
 */
export function shouldShowWhatsAppButton(status, dueDate) {
    if (status !== 'Dipinjam') return false;

    const remainingDays = calculateRemainingDays(dueDate);

    // Show button if: H-1, H-3, H-5, or overdue (negative days)
    return remainingDays <= 5 && (remainingDays === 1 || remainingDays === 3 || remainingDays === 5 || remainingDays < 0);
}

/**
 * Generate WhatsApp Click-to-Chat URL with pre-filled message
 * @param {string} phoneNumber - Phone number in international format (e.g., 628xxxx)
 * @param {string} borrowerName - Name of the borrower
 * @param {Array} equipmentList - Array of equipment objects with nama_alat property
 * @param {string|Date} dueDate - The due date
 * @param {number} remainingDays - Days remaining until due date
 * @returns {string} WhatsApp URL
 */
export function generateWhatsAppURL(phoneNumber, borrowerName, equipmentList, dueDate, remainingDays) {
    // Format equipment list
    const equipmentText = equipmentList
        .map((item, index) => `${index + 1}. ${item.nama_alat} (${item.kode_alat})`)
        .join('\n');

    // Format due date
    const formattedDueDate = format(new Date(dueDate), 'dd MMMM yyyy', { locale: localeId });

    // Handle overdue case
    const remainingText = remainingDays < 0
        ? `*TERLAMBAT ${Math.abs(remainingDays)} hari*`
        : `${remainingDays} hari`;

    // Construct message
    const message = `Halo *${borrowerName}*,

Kami mengingatkan bahwa peminjaman alat laboratorium berikut:

${equipmentText}

Memiliki batas waktu pengembalian pada tanggal *${formattedDueDate}*.

⏳ Sisa waktu peminjaman: *${remainingText}*

Mohon segera dikembalikan tepat waktu.

Terima kasih.
*Admin Laboratorium*`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Clean phone number (remove any spaces, dashes, or plus signs)
    let cleanPhone = phoneNumber.replace(/[\s\-+]/g, '');

    // Convert leading '0' to '62' (Indonesia country code)
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1);
    }

    // Return WhatsApp Click-to-Chat URL
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
