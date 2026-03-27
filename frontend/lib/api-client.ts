const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://omnigrievance.onrender.com";

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("omni_token");
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMessage);
  }

  return response.json();
};
