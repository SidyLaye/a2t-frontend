import apiClient from "./client";

export const exportsApi = {
    exportFEC: (params: { start_date: string; end_date: string }) =>
        apiClient.get("/api/v1/exports/fec/", { params, responseType: "blob" }).then((r) => r.data as Blob),
};
