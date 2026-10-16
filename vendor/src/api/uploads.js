/**
 * UPLOADS API
 * Backend: controllers/uploadController.js
 * Routes: /api/uploads/*
 */
import client from "./client";
import { compressImage } from "@/utils/imageCompress";

// Uploads can be several MB over mobile data and may hit a cold server, so they
// get a much longer timeout than the 15 s used for ordinary API calls.
const UPLOAD_CONFIG = { headers: { "Content-Type": "multipart/form-data" }, timeout: 90000 };

export const uploadVoiceNote = (blob) => {
  const formData = new FormData();
  formData.append("audio", blob, "voice-note.webm");
  return client.post("/uploads/voice-note", formData, UPLOAD_CONFIG);
};

export const uploadProductImages = async (files) => {
  const formData = new FormData();
  for (const file of files) formData.append("images", await compressImage(file));
  return client.post("/uploads/product-images", formData, UPLOAD_CONFIG);
};

export const uploadDisputeEvidence = async (files) => {
  const formData = new FormData();
  for (const file of files) formData.append("images", await compressImage(file));
  return client.post("/uploads/dispute-evidence", formData, UPLOAD_CONFIG);
};

export const uploadReviewPhotos = async (files) => {
  const formData = new FormData();
  for (const file of files) formData.append("images", await compressImage(file));
  return client.post("/uploads/review-photos", formData, UPLOAD_CONFIG);
};

export const uploadVendorLogo = async (file) => {
  const formData = new FormData();
  formData.append("logo", await compressImage(file));
  return client.post("/uploads/vendor-logo", formData, UPLOAD_CONFIG);
};

export const uploadNoticeImage = async (file) => {
  const formData = new FormData();
  formData.append("image", await compressImage(file));
  return client.post("/uploads/notice-image", formData, UPLOAD_CONFIG);
};
