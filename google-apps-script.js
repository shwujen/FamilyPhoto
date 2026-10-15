/**
 * ============================================================================
 * 📸 家庭照片網站 (Family Photo Vault) - Google Apps Script 後端服務端點
 * ============================================================================
 * 
 * 使用說明：
 * 1. 前往 https://script.google.com/ 點擊「新建專案」
 * 2. 清空原本的內容，將這整份程式碼複製貼上進去
 * 3. 修改下方的 FOLDER_ID 為您的 Google Drive 照片資料夾網址中的 ID
 *    例如網址是 drive.google.com/drive/folders/1a2b3c4d5e... 則 FOLDER_ID = "1a2b3c4d5e..."
 * 4. 點擊右上角「部署」 -> 「新建部署」
 * 5. 類型選擇「Web 應用程式 (Web app)」
 *    - 說明：家庭相片 API
 *    - 誰可以存取：所有人 (Anyone)
 * 6. 點擊「部署」並授權存取，複製產生的「網頁應用程式網址 (URL)」
 * 7. 將此 URL 貼入家庭相片網站的「設定」中即可！
 */

//const FOLDER_ID = "1PBFk02fNf2x6zBe8IdnS2P8cmAbPsMet"; // 請替換成您的 Google Drive 資料夾 ID

const FOLDER_ID = '1PBFk02fNf2x6zBe8IdnS2P8cmAbPsMet';



function doGet(e) {
  try {
    const targetFolderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : FOLDER_ID;

    if (!targetFolderId || targetFolderId === "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE" || targetFolderId.trim() === "") {
      return responseJSON({
        status: "error",
        message: "請在指令碼中設定有效的 FOLDER_ID 或透過 ?folderId= 參數傳入。"
      });
    }

    const folder = DriveApp.getFolderById(targetFolderId);
    const photos = [];

    // 遞迴讀取相片
    fetchPhotosFromFolder(folder, photos, folder.getName());

    return responseJSON({
      status: "success",
      folderName: folder.getName(),
      total: photos.length,
      photos: photos
    });

  } catch (error) {
    return responseJSON({
      status: "error",
      message: error.toString()
    });
  }
}

function fetchPhotosFromFolder(folder, photosArray, currentPath) {
  // 1. 取得當前資料夾的照片
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const mime = file.getMimeType();

    // 判斷是否為圖片
    if (mime.indexOf("image/") === 0 || mime.indexOf("video/") === 0) {
      const fileId = file.getId();
      const createdDate = file.getDateCreated();
      const dateStr = createdDate.toISOString().split('T')[0];
      const yearStr = dateStr.split('-')[0];

      photosArray.push({
        id: fileId,
        name: file.getName(),
        album: folder.getName(),
        folderName: folder.getName(),
        date: dateStr,
        year: yearStr,
        path: currentPath,
        mimeType: mime,
        url: `https://lh3.googleusercontent.com/d/${fileId}=w1600`,
        thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w800`,
        viewUrl: file.getUrl(),
        downloadUrl: `https://drive.google.com/uc?export=view&id=${fileId}`
      });
    }
  }

  // 2. 遞迴讀取子資料夾 (相簿)
  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next();
    fetchPhotosFromFolder(subFolder, photosArray, currentPath + " / " + subFolder.getName());
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
