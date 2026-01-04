export const COMPLIANCE_LEVELS = {
    VERY_GOOD: { label: 'Sangat Baik', min: 85, color: 'bg-green-100 text-green-700 border-green-200' },
    GOOD: { label: 'Baik', min: 70, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    FAIR: { label: 'Cukup', min: 50, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    POOR: { label: 'Buruk', min: 0, color: 'bg-red-100 text-red-700 border-red-200' },
};

export const getComplianceInfo = (score) => {
    if (score >= COMPLIANCE_LEVELS.VERY_GOOD.min) return COMPLIANCE_LEVELS.VERY_GOOD;
    if (score >= COMPLIANCE_LEVELS.GOOD.min) return COMPLIANCE_LEVELS.GOOD;
    if (score >= COMPLIANCE_LEVELS.FAIR.min) return COMPLIANCE_LEVELS.FAIR;
    return COMPLIANCE_LEVELS.POOR;
};

export const calculatePointChange = (lateDays) => {
    if (lateDays <= 0) return 5;
    if (lateDays <= 2) return -5;
    if (lateDays <= 5) return -10;
    return -20;
};
