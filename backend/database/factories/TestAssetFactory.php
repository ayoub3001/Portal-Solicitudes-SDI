<?php

namespace Database\Factories;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TestAssetFactory
{
    private const MINIMAL_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';

    /**
     * Genera una firma en formato data URI base64 (PNG).
     */
    public static function base64Signature(): string
    {
        if (! extension_loaded('gd')) {
            return 'data:image/png;base64,'.self::MINIMAL_PNG;
        }

        $width = 220;
        $height = 90;
        $image = imagecreatetruecolor($width, $height);
        $background = imagecolorallocate($image, 255, 255, 255);
        $ink = imagecolorallocate($image, 30, 30, 30);

        imagefill($image, 0, 0, $background);
        imageline($image, 20, 55, 60, 35, $ink);
        imageline($image, 60, 35, 110, 60, $ink);
        imageline($image, 110, 60, 180, 30, $ink);

        ob_start();
        imagepng($image);
        $binary = ob_get_clean();
        imagedestroy($image);

        return 'data:image/png;base64,'.base64_encode($binary);
    }

    /**
     * Contenido binario PNG de una firma de ejemplo.
     */
    public static function signatureBinary(): string
    {
        $base64 = self::base64Signature();

        return base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $base64));
    }

    /**
     * Guarda una firma PNG en storage/app/public y devuelve la ruta relativa.
     */
    public static function storeSignature(?string $fileName = null): string
    {
        $path = $fileName ?? 'signatures/'.uniqid('', true).'.png';

        Storage::disk('public')->put($path, self::signatureBinary());

        return $path;
    }

    /**
     * Guarda un PDF de ejemplo en storage/app/public y devuelve la ruta relativa.
     */
    public static function storeDocument(?string $fileName = null): string
    {
        $path = $fileName ?? 'requests/documents/'.uniqid('', true).'.pdf';

        Storage::disk('public')->put($path, self::pdfContent());

        return $path;
    }

    /**
     * Archivo PNG listo para subir en peticiones multipart.
     */
    public static function pngUpload(string $name = 'firma.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, self::signatureBinary());
    }

    /**
     * Contenido binario de un PDF de ejemplo.
     */
    public static function pdfContent(): string
    {
        $path = database_path('seeders/solicitudSoftwareEjemplo.pdf');

        if (file_exists($path)) {
            return file_get_contents($path);
        }

        return self::minimalPdf();
    }

    /**
     * Archivo PDF listo para subir en peticiones multipart.
     */
    public static function pdfUpload(string $name = 'solicitud-ejemplo.pdf'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, self::pdfContent());
    }

    private static function minimalPdf(): string
    {
        return <<<'PDF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 72 72 Td (Solicitud de ejemplo) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
308
%%EOF
PDF;
    }
}
