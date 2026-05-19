function normalizeText(text) {
    return (text ?? '').replaceAll('\r\n', '\n').trimEnd();
}
function indentLines(text, spaces) {
    const pad = ' '.repeat(spaces);
    return normalizeText(text)
        .split('\n')
        .map(line => (line.length ? `${pad}${line}` : pad))
        .join('\n');
}
export function buildHypnosisSendMessage({ features, durationMinutes, globalNote, }) {
    const selected = features.filter(f => f.isEnabled);
    const names = selected.map(f => f.title).filter(Boolean);
    const getNumericLabel = (f) => {
        switch (f.id) {
            case 'vip1_temp_sensitivity':
                return 'mức tăng độ nhạy';
            case 'vip1_estrus':
                return 'mức tăng dục vọng';
            case 'vip1_memory_erase':
                return 'thời lượng xóa ký ức(phút)';
            case 'vip2_pleasure':
                return 'cường độ khoái cảm';
            default:
                return null;
        }
    };
    const lines = [];
    lines.push('<gửi_thôi_miên>');
    lines.push(`danh sách chức năng đã bật: ${names.length ? names.join(', ') : ''}`);
    lines.push('hiệu quả thôi miên lần này:');
    for (const f of selected) {
        lines.push(`  ${f.title}:`);
        lines.push('    mô_tả:');
        lines.push(indentLines(f.description ?? '', 6));
        const numericLabel = getNumericLabel(f);
        if (numericLabel && typeof f.userNumber === 'number' && Number.isFinite(f.userNumber)) {
            lines.push(`    ${numericLabel}: ${f.userNumber}`);
        }
        lines.push('    ghi_chú:');
        lines.push(indentLines(f.userNote ?? '', 6));
    }
    lines.push(`thời lượng thôi miên lần này: ${durationMinutes} phút`);
    lines.push('ghi_chú:');
    lines.push(indentLines(globalNote ?? '', 2));
    lines.push('');
    lines.push('</gửi_thôi_miên>');
    return lines.join('\n');
}
