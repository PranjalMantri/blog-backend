import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dnv3etxf7",
  api_key: "934535735358629",
  api_secret: "UI96m3UkiYZ2MmQY3qIZnAIi5M4",
});

const uploadOnCloudinary = async (filePath) => {
  try {
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
  }
};

export { uploadOnCloudinary };
