(() => {
  'use strict';

  const SQL_WASM_URL = 'vendor/sql-wasm.wasm';

  const els = {
    status: document.getElementById('status'),
    statusSection: document.getElementById('status-section'),
    csvFile: document.getElementById('csv-file'),
    tableName: document.getElementById('table-name'),
    createBtn: document.getElementById('create-table-btn'),
    createMsg: document.getElementById('create-msg'),
    previewWrap: document.getElementById('preview-wrap'),
    preview: document.getElementById('csv-preview'),
    tableList: document.getElementById('table-list'),
    query: document.getElementById('query'),
    runBtn: document.getElementById('run-query-btn'),
    downloadBtn: document.getElementById('download-csv-btn'),
    queryMsg: document.getElementById('query-msg'),
    result: document.getElementById('result'),
  };

  let db = null;
  let parsedCsv = null;
  let lastResult = null;

  function setStatus(text, kind) {
    els.status.textContent = text;
    els.statusSection.classList.remove('ready', 'error');
    if (kind) els.statusSection.classList.add(kind);
  }

  function setMsg(el, text, kind) {
    el.textContent = text || '';
    el.classList.remove('error', 'success');
    if (kind) el.classList.add(kind);
  }

  function quoteIdent(name) {
    return '"' + String(name).replace(/"/g, '""') + '"';
  }

  function sanitizeHeader(h, idx) {
    const s = String(h == null ? '' : h).trim();
    return s.length ? s : `col_${idx + 1}`;
  }

  function inferColumnType(values) {
    let hasAny = false;
    let allInt = true;
    let allReal = true;
    for (const v of values) {
      if (v === '' || v == null) continue;
      hasAny = true;
      if (!/^-?\d+$/.test(v)) allInt = false;
      if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v)) allReal = false;
      if (!allInt && !allReal) return 'TEXT';
    }
    if (!hasAny) return 'TEXT';
    if (allInt) return 'INTEGER';
    if (allReal) return 'REAL';
    return 'TEXT';
  }

  function renderTable(container, columns, rows, limit) {
    const n = typeof limit === 'number' ? Math.min(limit, rows.length) : rows.length;
    if (!columns.length) {
      container.innerHTML = '<p class="msg">(열이 없습니다)</p>';
      return;
    }
    const parts = ['<table><thead><tr>'];
    for (const c of columns) parts.push(`<th>${escapeHtml(c)}</th>`);
    parts.push('</tr></thead><tbody>');
    for (let i = 0; i < n; i++) {
      parts.push('<tr>');
      for (const c of columns) {
        const v = rows[i][c];
        parts.push(`<td>${v == null ? '<span class="msg">NULL</span>' : escapeHtml(String(v))}</td>`);
      }
      parts.push('</tr>');
    }
    parts.push('</tbody></table>');
    if (typeof limit === 'number' && rows.length > limit) {
      parts.push(`<p class="msg">… 총 ${rows.length}행 중 ${limit}행 표시</p>`);
    }
    container.innerHTML = parts.join('');
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function refreshTableList() {
    if (!db) return;
    const res = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    const names = res.length ? res[0].values.map((r) => r[0]) : [];
    if (!names.length) {
      els.tableList.textContent = '아직 생성된 테이블이 없습니다.';
      return;
    }
    const items = [];
    for (const name of names) {
      const info = db.exec(`PRAGMA table_info(${quoteIdent(name)})`);
      const cols = info.length ? info[0].values.map((r) => `${r[1]} ${r[2]}`) : [];
      const countRes = db.exec(`SELECT COUNT(*) FROM ${quoteIdent(name)}`);
      const count = countRes[0].values[0][0];
      items.push(
        `<li><span class="tname">${escapeHtml(name)}</span> <span class="tcols">(${count}행 · ${cols.map(escapeHtml).join(', ')})</span></li>`
      );
    }
    els.tableList.innerHTML = `<ul>${items.join('')}</ul>`;
  }

  function createTableFromCsv(tableName, parsed) {
    const rawHeaders = parsed.meta.fields || [];
    const headers = rawHeaders.map((h, i) => sanitizeHeader(h, i));
    const seen = new Set();
    const uniqueHeaders = headers.map((h, i) => {
      let name = h;
      let k = 1;
      while (seen.has(name.toLowerCase())) {
        name = `${h}_${k++}`;
      }
      seen.add(name.toLowerCase());
      return name;
    });

    const colTypes = uniqueHeaders.map((_, i) => {
      const raw = rawHeaders[i];
      const values = parsed.data.map((row) => {
        const v = row[raw];
        return v == null ? '' : String(v);
      });
      return inferColumnType(values);
    });

    const qTable = quoteIdent(tableName);
    const colDefs = uniqueHeaders
      .map((h, i) => `${quoteIdent(h)} ${colTypes[i]}`)
      .join(', ');

    db.run(`DROP TABLE IF EXISTS ${qTable}`);
    db.run(`CREATE TABLE ${qTable} (${colDefs})`);

    const placeholders = uniqueHeaders.map(() => '?').join(', ');
    const insertSql = `INSERT INTO ${qTable} VALUES (${placeholders})`;
    const stmt = db.prepare(insertSql);
    db.run('BEGIN');
    try {
      for (const row of parsed.data) {
        const vals = rawHeaders.map((h, i) => {
          const v = row[h];
          if (v == null || v === '') return null;
          if (colTypes[i] === 'INTEGER') return parseInt(v, 10);
          if (colTypes[i] === 'REAL') return parseFloat(v);
          return String(v);
        });
        stmt.run(vals);
      }
      db.run('COMMIT');
    } catch (e) {
      db.run('ROLLBACK');
      throw e;
    } finally {
      stmt.free();
    }
    return { columns: uniqueHeaders, rowCount: parsed.data.length };
  }

  function resultToCsv(columns, rows) {
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [columns.map(esc).join(',')];
    for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(','));
    return lines.join('\n');
  }

  // --- Event handlers ---

  els.csvFile.addEventListener('change', () => {
    setMsg(els.createMsg, '');
    parsedCsv = null;
    els.previewWrap.hidden = true;
    els.preview.innerHTML = '';

    const file = els.csvFile.files && els.csvFile.files[0];
    if (!file) return;

    if (!els.tableName.value) {
      const base = file.name.replace(/\.csv$/i, '').replace(/[^A-Za-z0-9_]/g, '_');
      els.tableName.value = base || 'my_table';
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        parsedCsv = results;
        const fields = results.meta.fields || [];
        const previewRows = results.data.slice(0, 10);
        renderTable(els.preview, fields, previewRows, 10);
        els.previewWrap.hidden = false;
        setMsg(
          els.createMsg,
          `CSV 파싱 완료: ${results.data.length}행 · ${fields.length}열`,
          'success'
        );
      },
      error: (err) => {
        setMsg(els.createMsg, `CSV 파싱 실패: ${err.message}`, 'error');
      },
    });
  });

  els.createBtn.addEventListener('click', () => {
    if (!db) {
      setMsg(els.createMsg, 'SQLite 엔진이 아직 준비되지 않았습니다.', 'error');
      return;
    }
    if (!parsedCsv) {
      setMsg(els.createMsg, 'CSV 파일을 먼저 업로드하세요.', 'error');
      return;
    }
    const name = els.tableName.value.trim();
    if (!name) {
      setMsg(els.createMsg, '테이블 이름을 입력하세요.', 'error');
      return;
    }
    try {
      const { columns, rowCount } = createTableFromCsv(name, parsedCsv);
      setMsg(
        els.createMsg,
        `${name} 생성 완료 (${rowCount}행, 열: ${columns.join(', ')})`,
        'success'
      );
      refreshTableList();
      if (!els.query.value.trim()) {
        els.query.value = `SELECT * FROM ${quoteIdent(name)} LIMIT 10;`;
      }
    } catch (e) {
      setMsg(els.createMsg, `테이블 생성 실패: ${e.message}`, 'error');
    }
  });

  els.runBtn.addEventListener('click', () => {
    if (!db) return;
    const sql = els.query.value.trim();
    if (!sql) {
      setMsg(els.queryMsg, '쿼리를 입력하세요.', 'error');
      return;
    }
    els.result.innerHTML = '';
    els.downloadBtn.disabled = true;
    lastResult = null;
    try {
      const t0 = performance.now();
      const results = db.exec(sql);
      const elapsed = (performance.now() - t0).toFixed(1);
      if (!results.length) {
        setMsg(els.queryMsg, `쿼리 실행 완료 (${elapsed}ms, 반환 행 없음).`, 'success');
        refreshTableList();
        return;
      }
      const last = results[results.length - 1];
      const rows = last.values.map((rowArr) => {
        const obj = {};
        last.columns.forEach((c, i) => (obj[c] = rowArr[i]));
        return obj;
      });
      renderTable(els.result, last.columns, rows, 100);
      lastResult = { columns: last.columns, rows };
      els.downloadBtn.disabled = rows.length === 0;
      setMsg(els.queryMsg, `${rows.length}행 (${elapsed}ms).`, 'success');
      refreshTableList();
    } catch (e) {
      setMsg(els.queryMsg, `쿼리 실패: ${e.message}`, 'error');
    }
  });

  els.downloadBtn.addEventListener('click', () => {
    if (!lastResult) return;
    const csv = resultToCsv(lastResult.columns, lastResult.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_result.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // --- Bootstrap sql.js ---

  initSqlJs({ locateFile: () => SQL_WASM_URL })
    .then((SQL) => {
      db = new SQL.Database();
      setStatus('SQLite(WASM) 준비 완료. CSV를 업로드해 시작하세요.', 'ready');
      els.createBtn.disabled = false;
      els.runBtn.disabled = false;
    })
    .catch((err) => {
      setStatus(`SQLite 로딩 실패: ${err.message}`, 'error');
    });
})();
