export async function parseDocuments(
    file: File
): Promise<Array<{ text: string; title?: string; section?: string; index: number }>> {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        throw new Error(
            'Los PDFs no están soportados actualmente. Por favor, convierte el archivo a TXT o Markdown (.md)'
        );
    } else if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        const content = await file.text();
        return parseMarkdown(content);
    } else {
        const content = await file.text();
        return parseText(content, file.name);
    }
}

function parseMarkdown(
    content: string
): Array<{ text: string; title?: string; section?: string; index: number }> {
    const sections = content.split(/^##\s+/m);
    return sections
        .filter((section) => section.trim())
        .map((section, idx) => {
            const lines = section.split('\n');
            const title = lines[0].trim();
            const text = lines.slice(1).join('\n').trim();
            return {
                text,
                title,
                section: title,
                index: idx,
            };
        })
        .filter((s) => s.text.length > 0);
}

function parseText(
    content: string,
    fileName: string
): Array<{ text: string; title?: string; section?: string; index: number }> {
    const chunkSize = 1500;
    const chunks = [];

    const cleanContent = content
        .replace(/\f/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();

    const paragraphs = cleanContent.split('\n').filter(p => p.trim().length > 0);

    let currentChunk = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
        if ((currentChunk + ' ' + para).length > chunkSize && currentChunk.length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                title: fileName,
                index: chunkIndex++,
            });
            currentChunk = para;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + para;
        }
    }

    if (currentChunk.trim()) {
        chunks.push({
            text: currentChunk.trim(),
            title: fileName,
            index: chunkIndex,
        });
    }

    return chunks.filter(c => c.text.length > 50);
}