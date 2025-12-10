"use client"

import { Checkbox } from "@/components/ui/checkbox"

export interface ConsentData {
    globalFaceSearch: boolean
    dataProcessing: boolean
}

interface PrivacyConsentFormProps {
    consent: ConsentData
    onChange: (key: keyof ConsentData) => void
    disabled?: boolean
}

export function PrivacyConsentForm({ consent, onChange, disabled = false }: PrivacyConsentFormProps) {
    return (
        <div className="space-y-4">
            {/* Face Search Consent */}
            <div className="space-y-3 p-4 border border-border/50 rounded-lg bg-card/30">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="globalFaceSearch"
                        checked={consent.globalFaceSearch}
                        onCheckedChange={() => onChange("globalFaceSearch")}
                        disabled={disabled}
                        className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                        <label
                            htmlFor="globalFaceSearch"
                            className="text-sm font-semibold text-foreground cursor-pointer block"
                        >
                            Enable AI Face Search
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                            Allow the system to identify your face in event photos and create a personal photo album. You can
                            change this per-event or withdraw consent anytime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Processing Consent */}
            <div className="space-y-3 p-4 border border-border/50 rounded-lg bg-card/30">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="dataProcessing"
                        checked={consent.dataProcessing}
                        onCheckedChange={() => onChange("dataProcessing")}
                        disabled={disabled}
                        className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                        <label
                            htmlFor="dataProcessing"
                            className="text-sm font-semibold text-foreground cursor-pointer block"
                        >
                            Data Processing Agreement
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                            I understand my biometric data will be processed and stored securely in compliance with GDPR and
                            PDPA regulations. Data is retained only for the duration of the event.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
