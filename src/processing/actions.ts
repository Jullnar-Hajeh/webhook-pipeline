export function processPayload(actionType: string, payload: any, config: any): any {
    const data = typeof payload === "object" && payload !== null ? { ...payload } : { data: payload };

    switch (actionType) {
        case "uppercase":
            const upperData: any = {};
            for (const [key, value] of Object.entries(data)) {
                upperData[key] = typeof value === "string" ? value.toUpperCase() : value;
            }
            return upperData;

        case "extract-fields":
            const fieldsToExtract = config?.fields; 
            if (!Array.isArray(fieldsToExtract) || fieldsToExtract.length === 0) {
                return data; 
            }
            
            const extractedData: any = {};
            fieldsToExtract.forEach((field) => {
                if (data[field] !== undefined) extractedData[field] = data[field];
            });
            return extractedData;

        case "add-metadata":
            return {
                ...data,
                _metadata: {
                    processedAt: new Date().toISOString(),
                    source: config?.source || "webhook-pipeline-system",
                    ...config?.customMeta
                }
            };

        default:
            return data;
    }
}