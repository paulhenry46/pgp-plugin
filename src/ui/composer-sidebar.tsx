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

export function ComposerSidebar() {
  const [attachments, setAttachments] = useState<AttachmentEntry[]>([]);

  // Fonction pour charger les fichiers depuis IndexedDB
  const loadAttachments = async () => {
    try {
      const files = await getAllAttachments();
      setAttachments(files);
    } catch (err) {
      console.error("Error loading attachments in sidebar:", err);
    }
  };

  // Synchronisation : charge les fichiers au montage et vérifie les changements toutes les secondes
  useEffect(() => {
    loadAttachments();
    const interval = setInterval(loadAttachments, 1000);
    return () => clearInterval(interval);
  }, []);

  // Gestion de la suppression d'un fichier
  const handleDelete = async (id: string) => {
    try {
      await deleteAttachment(id);
      // Mise à jour optimiste de l'UI
      setAttachments((prev) => prev.filter((file) => file.id !== id));
    } catch (err) {
      console.error("Error deleting attachment:", err);
    }
  };

  // Fonction utilitaire pour formater la taille des fichiers (ex: 263.55 KB, 20.00 MB)
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Si aucun fichier n'est présent, on peut optionnellement retourner null ou un indicateur vide
  if (attachments.length === 0) {
    return h('div', { 
      style: { 
        padding: '12px', 
        fontSize: '13px', 
        color: 'var(--color-muted-foreground, #64748b)', 
        fontStyle: 'italic' 
      } 
    }, 'No attachments uploaded.');
  }

  return h('div', { 
    style: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px', 
      padding: '12px',
      maxHeight: '100%',
      overflowY: 'auto'
    } 
  },
    // Injection des styles pour gérer les effets de survol (:hover) sans Tailwind
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
        color: #ef4444 !important; /* Rouge Red-500 */
      }
    `),

    // Boucle sur les pièces jointes stockées
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
          // Icône Trombone (Paperclip)
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
            style: { width: '12px', height: '12px', flexShrink: 0 },
            'aria-hidden': 'true'
          },
            h('path', { d: 'm16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551' })
          ),

          // Conteneur texte (Nom + Taille)
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexGrow: 1 } },
            h('span', { 
              style: { 
                maxWidth: '150px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              },
              title: file.name // Affiche le nom complet au survol de la souris
            }, file.name),
            h('span', { 
              style: { 
                fontSize: '0.75rem', 
                color: 'var(--color-muted-foreground, #64748b)', 
                whiteSpace: 'nowrap' 
              } 
            }, `(${formatSize(file.size)})`)
          ),

          // Bouton Supprimer (X)
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