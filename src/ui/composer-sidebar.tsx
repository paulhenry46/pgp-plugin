import React from 'react';
const h = React.createElement;
const { useState, useEffect } = React;

import { getAllAttachments, deleteAttachment } from '../storage.ts';

interface AttachmentEntry {
  id: string;
  name: string;
  type: string;
  size: number;
  file: Blob | File;
}

// ──  MAPPING ICON SVG ───────────────────────────────────
function getFileIcon(name: string, type: string) {
  const mime = type.toLowerCase();
  const ext = name.split('.').pop()?.toLowerCase() || '';

  // 1. Image + SVG
  if (mime.startsWith('image/') || ext === 'svg') {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-image' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#ffa733' }),
        h('path', { d: 'm 17.0616,15.9692 c 0.514,0 0.8114,-0.5501 0.5098,-0.9431 l -3.5317,-4.6019 c -0.1508,-0.1965 -0.4609,-0.1965 -0.6117,0 l -2.5684,3.3466 -1.428,-1.8607 c -0.1508,-0.1965 -0.46092,-0.1965 -0.61172,0 l -2.39139,3.116 c -0.30158,0.393 -0.00422,0.9431 0.50977,0.9431 z', fill: '#ffffff' }),
        h('path', { d: 'm 11.4307,9.13847 c 0,0.62876 -0.5097,1.13843 -1.1384,1.13843 -0.62878,0 -1.13849,-0.50967 -1.13849,-1.13843 C 9.15381,8.50971 9.66352,8 10.2923,8 c 0.6287,0 1.1384,0.50971 1.1384,1.13847 z', fill: '#ffffff' })
      )
    );
  }

  // 2. Document Word / LibreOffice Writer
  if (mime.includes('word') || mime.includes('officedocument.wordprocessingml') || mime.includes('opendocument.text') || ext === 'doc' || ext === 'docx' || ext === 'odt') {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-doc' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#5c8dff' }),
        h('path', { d: 'm 16.4684,7.20001 c -0.1492,0 -0.2785,0.10308 -0.3119,0.24848 L 14.4737,14.7875 12.7112,7.44532 C 12.6767,7.30145 12.548,7.20001 12.4001,7.20001 h -0.7749 c -0.1472,0 -0.2753,0.10036 -0.3107,0.24321 L 9.49893,14.7875 7.84264,7.44956 C 7.8097,7.30364 7.68007,7.20001 7.53049,7.20001 H 6.8005 c -0.20526,0 -0.35744,0.19052 -0.31209,0.3907 L 8.51818,16.5507 C 8.55121,16.6965 8.68078,16.8 8.83028,16.8 h 1.34152 c 0.1476,0 0.276,-0.1009 0.3109,-0.2443 l 1.5172,-6.2282 1.4907,6.227 c 0.0345,0.144 0.1632,0.2455 0.3113,0.2455 h 1.3411 c 0.1492,0 0.2786,-0.1031 0.3119,-0.2484 L 17.5101,7.59155 C 17.5561,7.39114 17.4038,7.20001 17.1982,7.20001 Z', fill: '#ffffff' })
      )
    );
  }

  // 3. PDF
  if (mime === 'application/pdf' || ext === 'pdf') {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-pdf', fill: 'none' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#ec3213' }),
        h('path', { d: 'm 11.9162,10.5752 0.8874,-1.53763 c 0.0899,-0.15582 0.1372,-0.33255 0.1372,-0.51244 0,-0.17989 -0.0473,-0.35661 -0.1372,-0.51241 -0.09,-0.15581 -0.2193,-0.28521 -0.3751,-0.3752 -0.1558,-0.09 -0.3324,-0.13743 -0.5123,-0.13752 -0.18,10e-6 -0.3567,0.04737 -0.5126,0.13733 -0.1558,0.08996 -0.2852,0.21936 -0.3752,0.37518 -0.09,0.15581 -0.1374,0.33257 -0.1374,0.5125 0,0.17994 0.0473,0.35671 0.1372,0.51256 z m 0,0 1.9916,3.8638 M 11.9162,10.5752 9.94187,14.439 m 0,0 H 7.9658 c -0.14427,0 -0.28713,0.0284 -0.42042,0.0836 -0.13329,0.0552 -0.2544,0.1361 -0.35642,0.2382 -0.10201,0.102 -0.18293,0.2231 -0.23814,0.3564 -0.05521,0.1333 -0.08363,0.2761 -0.08363,0.4204 0,1.1048 1.44798,1.518 2.03136,0.58 z m 0,0 h 3.96593 m 0,0 h 1.9766 c 0.1441,0 0.2869,0.0284 0.42,0.0836 0.1332,0.0553 0.2541,0.1362 0.356,0.2383 0.1018,0.102 0.1825,0.2232 0.2374,0.3565 0.055,0.1332 0.0831,0.276 0.0828,0.4202 0,1.1048 -1.4475,1.518 -2.0309,0.58 z', stroke: '#ffffff', strokeWidth: '1.15', strokeMiterlimit: '10' })
      )
    );
  }

  // 4. PPT / LibreOffice Impress
  if (mime.includes('powerpoint') || mime.includes('officedocument.presentationml') || mime.includes('opendocument.presentation') || ext === 'ppt' || ext === 'pptx' || ext === 'odp') {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-ppt' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#f47425' }),
        h('path', { d: 'm 11.6436,7.11255 c -2.90503,0 -5.2437,2.35693 -5.2437,5.24375 0,2.8868 2.33867,5.2437 5.2437,5.2437 2.8868,0 5.2437,-2.3387 5.2437,-5.2437 h -5.2437 z', fill: '#ffffff' }),
        h('path', { d: 'm 12.356,6.40002 v 5.24368 h 5.2437 c 0,-2.90501 -2.3387,-5.24368 -5.2437,-5.24368 z', fill: '#ffffff' })
      )
    );
  }

  // 5. Video / Audio
  if (mime.startsWith('video/') || mime.startsWith('audio/') || ext === 'mp4' || ext === 'mp3' || ext === 'mkv' || ext === 'avi') {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-video' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#7f2aff' }),
        h('path', { d: 'm 15.5314,11.1915 c 0.6248,0.3652 0.6248,1.236 0,1.6012 l -5.0831,3.062 C 9.79513,16.248 9,15.7985 9,15.04 V 8.94422 C 9,8.21384 9.82353,7.76438 10.4483,8.12957 Z', fill: '#ffffff' })
      )
    );
  }

  // 6.  Excel / LibreOffice Calc
  if (mime.includes('excel') || mime.includes('officedocument.spreadsheetml') || mime.includes('opendocument.spreadsheet') || ext === 'xls' || ext === 'xlsx' || ext === 'ods' || ext === 'csv') {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-xls' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#29a349' }),
        h('path', { d: 'm 16.8999,9.34739 c 0,-0.25434 -0.2062,-0.46052 -0.4605,-0.46052 H 9.8078 V 6.86055 c 0,-0.25434 -0.20619,-0.46053 -0.46053,-0.46053 -0.25434,0 -0.46053,0.20619 -0.46053,0.46053 V 8.88687 H 6.86043 c -0.25434,0 -0.46053,0.20618 -0.46053,0.46052 0,0.25434 0.20619,0.46053 0.46053,0.46053 h 2.02631 v 6.63158 c 0,0.2543 0.20619,0.4605 0.46053,0.4605 0.25434,0 0.46053,-0.2062 0.46053,-0.4605 V 9.80792 h 6.6316 c 0.2543,0 0.4605,-0.20619 0.4605,-0.46053 z', fill: '#ffffff' })
      )
    );
  }

  // 7. XML / Code / TeX
  if (mime.includes('xml') || mime.includes('javascript') || mime.includes('typescript') || mime.includes('html') || mime.includes('json') || mime.includes('x-tex') || ['xml', 'js', 'ts', 'tsx', 'html', 'css', 'json', 'tex'].includes(ext)) {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-xml', fill: 'none' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#dadbe0' }),
        h('path', { d: 'M 15.5,9.19995 18.3,11.65 15.5,14.1', stroke: '#3a3f4a', strokeWidth: '1.4', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M 8.5,9.19995 5.7,11.65 8.5,14.1', stroke: '#3a3f4a', strokeWidth: '1.4', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('rect', { x: '10.075', y: '15.9182', width: '9.5559301', height: '1.4', rx: '0.69999999', transform: 'rotate(-75,10.075,15.9182)', fill: '#3a3f4a' })
      )
    );
  }

  // 8. ZIP / TAR / RAR
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('compressed') || ['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
    return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
      h('g', { id: 'mime-md-zip' },
        h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#dadbe0' }),
        h('path', { fillRule: 'evenodd', clipRule: 'evenodd', d: 'm 11.7251,2 c -0.4142,0 -0.75,0.33579 -0.75,0.75 0,0.41421 0.3358,0.75 0.75,0.75 h 0.546 c 0.4142,0 0.75,-0.33579 0.75,-0.75 0,-0.41421 -0.3358,-0.75 -0.75,-0.75 z m 0,2 c -0.4142,0 -0.75,0.33579 -0.75,0.75 0,0.41421 0.3358,0.75 0.75,0.75 h 0.546 c 0.4142,0 0.75,-0.33579 0.75,-0.75 0,-0.41421 -0.3358,-0.75 -0.75,-0.75 z m -0.75,2.75 c 0,-0.41421 0.3358,-0.75 0.75,-0.75 h 0.546 c 0.4142,0 0.75,0.33579 0.75,0.75 0,0.41421 -0.3358,0.75 -0.75,0.75 h -0.546 c -0.4142,0 -0.75,-0.33579 -0.75,-0.75 z m 0.75,1.25 c -0.4142,0 -0.75,0.33579 -0.75,0.75 0,0.41421 0.3358,0.75 0.75,0.75 h 0.546 c 0.4142,0 0.75,-0.33579 0.75,-0.75 0,-0.41421 -0.3358,-0.75 -0.75,-0.75 z m -0.75,2.75 c 0,-0.4142 0.3358,-0.75 0.75,-0.75 h 0.546 c 0.4142,0 0.75,0.3358 0.75,0.75 0,0.4142 -0.3358,0.75 -0.75,0.75 h -0.546 c -0.4142,0 -0.75,-0.3358 -0.75,-0.75 z M 11.1794,12 h 1.6367 c 0,0.6712 0.6005,2.4053 1.2043,3.9795 C 14.5728,17.4194 13.5278,19 11.9856,19 10.4362,19 9.39089,17.4059 9.95573,15.9631 10.5703,14.3933 11.1794,12.6689 11.1794,12 Z m -0.2048,4.75 c 0,-0.4142 0.3358,-0.75 0.75,-0.75 h 0.546 c 0.4142,0 0.75,0.3358 0.75,0.75 0,0.4142 -0.3358,0.75 -0.75,0.75 h -0.546 c -0.4142,0 -0.75,-0.3358 -0.75,-0.75 z', fill: '#3a3f4a' })
      )
    );
  }

  // 9. Default / Text
  return h('svg', { version: '1.1', width: '24', height: '24', viewBox: '0 0 24 24', style: { width: '16px', height: '16px', flexShrink: 0 } },
    h('g', { id: 'mime-md-text' },
      h('path', { d: 'M 0,2.5 C 0,1.11929 1.11929,0 2.5,0 h 19 C 22.8807,0 24,1.11929 24,2.5 v 19 C 24,22.8807 22.8807,24 21.5,24 H 2.5 C 1.11929,24 0,22.8807 0,21.5 Z', fill: '#dadbe0' }),
      h('path', { d: 'M 7,8 H 17 M 7,12 H 17 M 7,16 h 10', stroke: '#3a3f4a', strokeWidth: '1.15', strokeLinecap: 'round' })
    )
  );
}

// ──  SIDEBAR ──────────────────────────────────────
export function ComposerSidebar() {
  const [attachments, setAttachments] = useState<AttachmentEntry[]>([]);

  const loadAttachments = async () => {
    try {
      const files = await getAllAttachments();
      setAttachments(files);
    } catch (err) {
      console.error("Error loading attachments in sidebar:", err);
    }
  };

  useEffect(() => {
    loadAttachments();
    const interval = setInterval(loadAttachments, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteAttachment(id);
      setAttachments((prev) => prev.filter((file) => file.id !== id));
    } catch (err) {
      console.error("Error deleting attachment:", err);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (attachments.length === 0) {
    return h('div', { 
      style: { padding: '12px', fontSize: '13px', color: 'var(--color-muted-foreground, #64748b)', fontStyle: 'italic' } 
    }, 'No attachments uploaded.');
  }

  return h('div', { 
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', maxHeight: '100%', overflowY: 'auto' } 
  },
    h('style', null, `
      .attachment-item {
        background-color: var(--color-muted, #f1f5f9);
        color: var(--color-foreground, #0f172a);
        transition: background-color 150ms ease;
      }
      .attachment-delete-btn {
        color: var(--color-muted-foreground, #64748b);
        transition: color 150ms ease;
      }
      .attachment-delete-btn:hover {
        color: #ef4444 !important;
      }
    `),

    attachments.map((file) => 
      h('div', {
        key: file.id,
        className: 'attachment-item',
        style: {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          overflow: 'hidden'
        }
      },
        h('div', { style: { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', width: '100%' } },
          
          getFileIcon(file.name, file.type),

          h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexGrow: 1 } },
            h('span', { 
              style: { maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
              title: file.name
            }, file.name),
            h('span', { 
              style: { fontSize: '0.75rem', color: 'var(--color-muted-foreground, #64748b)', whiteSpace: 'nowrap' } 
            }, `(${formatSize(file.size)})`)
          ),

          h('button', {
            className: 'attachment-delete-btn',
            style: {
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              marginLeft: '4px',
              minWidth: '20px',
              minHeight: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            },
            onClick: () => handleDelete(file.id),
            title: `Delete ${file.name}`
          },
            h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '24',
              height: '24',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              style: { width: '12px', height: '12px' },
              'aria-hidden': 'true'
            },
              h('path', { d: 'M18 6 6 18' }),
              h('path', { d: 'm6 6 12 12' })
            )
          )
        )
      )
    )
  );
}