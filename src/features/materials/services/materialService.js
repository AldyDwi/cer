import api from "../../../services/api";

export async function getMaterials({ search = "", perPage = 10, page = 1 } = {}) {
  const response = await api.get("/materials", {
    params: {
      search: search || undefined,
      per_page: perPage,
      page,
    },
  });

  return response.data;
}

export async function createMaterial(data) {
  const response = await api.post("/materials", data);
  return response.data;
}

export async function getMaterial(id) {
  const response = await api.get(`/materials/${id}`);
  return response.data;
}

export async function updateMaterial(id, data) {
  const response = await api.put(`/materials/${id}`, data);
  return response.data;
}

export async function deleteMaterial(id) {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
}

export async function getMaterialOptions() {
  const response = await api.get("/materials/options");
  return response.data;
}