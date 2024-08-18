function formatDataForSave(drawing) {
    const lines = drawing.lines.map(line => {
        return line.map(p => [p.x, p.y]);
    });

    return { lines };
}

function formatDataForLoad(drawing) {
    const lines = drawing.lines.map(line => {
        return line.map(p => ({ x: p[0], y: p[1] }));
    });

    return { lines };
}