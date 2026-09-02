/**
 * 统一响应格式
 */
export function successResponse(res, data = null, meta = null) {
  const response = {
    code: 0,
    message: 'success',
  };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(200).json(response);
}

export function createdResponse(res, data = null) {
  return res.status(201).json({
    code: 0,
    message: 'created',
    data,
  });
}

export function errorResponse(res, code, message, details = null) {
  const response = {
    code,
    message,
  };
  if (details) response.details = details;
  return res.status(code >= 400 && code < 600 ? code : 500).json(response);
}

export function paginationMeta(page, pageSize, total) {
  return {
    page: Number(page),
    pageSize: Number(pageSize),
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
