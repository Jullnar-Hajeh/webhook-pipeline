export function processPayload(actionType: string, payload: any, actionConfig: any = {}) {
    let data = typeof payload === "object" && payload !== null ? { ...payload } : { data: payload };

    switch (actionType) {
        case "uppercase":
            for (const key in data) {
                if (typeof data[key] === "string") {
                    data[key] = data[key].toUpperCase();
                }
            }
            return data;

        case "extract-fields":
            if (!actionConfig.fields || !Array.isArray(actionConfig.fields)) {
                return data;
            }
            const extracted: any = {};
            actionConfig.fields.forEach((field: string) => {
                if (data[field] !== undefined) {
                    extracted[field] = data[field];
                }
            });
            return Object.keys(extracted).length > 0 ? extracted : data;

        case "add-metadata":
            return {
                ...data,
                _metadata: {
                    processedAt: new Date().toISOString(),
                    customTag: actionConfig.tag || "webhook-pipeline-processed",
                }
            };

        default:
            return data;
    }
}