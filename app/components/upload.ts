async function handleUpload(file: File) {
  // 1. Get the presigned URL from your server
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type
    })
  });
  const { uploadUrl } = await response.json();

  // 2. Upload directly to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });
}
