import api from "../../../services/api";

export async function getCerQuizzes() {
  const response = await api.get("/cer-quizzes");

  return response.data;
}

export async function getCerQuiz(id) {
  const response = await api.get(`/cer-quizzes/${id}`);

  return response.data;
}

export async function createCerQuiz(data) {
  const response = await api.post("/cer-quizzes", data);

  return response.data;
}

export async function updateCerQuiz(id, data) {
  const response = await api.put(
    `/cer-quizzes/${id}`,
    data
  );

  return response.data;
}

export async function deleteCerQuiz(id) {
  const response = await api.delete(
    `/cer-quizzes/${id}`
  );

  return response.data;
}

export async function getCerItems(quizId) {
  const response = await api.get(
    `/cer-quizzes/${quizId}/items`
  );

  return response.data;
}

export async function createCerItem(quizId, data) {
  const response = await api.post(
    `/cer-quizzes/${quizId}/items`,
    data
  );

  return response.data;
}

export async function updateCerItem(id, data) {
  const response = await api.put(
    `/cer-items/${id}`,
    data
  );

  return response.data;
}

export async function deleteCerItem(id) {
  const response = await api.delete(
    `/cer-items/${id}`
  );

  return response.data;
}

export async function updateCerQuizStatus(id, status) {
  const response = await api.patch(
    `/cer-quizzes/${id}/status`,
    { status }
  );

  return response.data;
}

export async function generateDistractors(activityId, data) {
  const response = await api.post(
    `/cer-quizzes/${activityId}/generate-distractors`,
    data
  );

  return response.data;
}

export async function getGradeRecap(quizId) {
  const response = await api.get(
    `/cer-quizzes/${quizId}/grades`
  );

  return response.data;
}