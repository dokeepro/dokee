export function readFilesAsDataUrl(files: File[]): Promise<{ name: string; type: string; size: number; dataUrl: string }[]> {
    return Promise.all(files.map(file => {
        return new Promise<{ name: string; type: string; size: number; dataUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: reader.result as string,
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }));
}
export function dataUrlToFile(dataUrl: string, name: string, type: string): File {
    const arr = dataUrl.split(',');
    const mime = type || (arr[0].match(/:(.*?);/)?.[1] ?? 'application/octet-stream');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], name, { type: mime });
}