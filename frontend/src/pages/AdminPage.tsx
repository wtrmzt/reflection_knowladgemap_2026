import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// ... (コンポーネント定義内) ...
const [isDownloading, setIsDownloading] = useState(false);

const handleDownloadDb = async () => {
    setIsDownloading(true);
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert('管理者としてログインしていません。');
        setIsDownloading(false);
        return;                                                                                        
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    try {
        const response = await fetch(`${apiUrl}/api/admin/export_csv`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('データベースのダウンロードに失敗しました。');
        }

        // CSVデータをBlobとして取得し、ブラウザ上でダウンロードを発火
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // ダウンロードファイル名に現在の日付を付与
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `database_export_${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        
        // メモリリーク防止のため後処理
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export Error:", error);
        alert('データベースのダウンロードに失敗しました。');
    } finally {
        setIsDownloading(false);
    }
};

// ... JSXの戻り値 ...
<Button 
    onClick={handleDownloadDb} 
    disabled={isDownloading}
    variant="outline"
>
    <Download className="mr-2 h-4 w-4" />
    {isDownloading ? 'ダウンロード中...' : 'データベースをダウンロード'}
</Button>