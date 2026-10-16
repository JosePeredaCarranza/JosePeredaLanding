'use client';

import { useId, useState } from 'react';
import { FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { Photo } from './Photo';
import { safeUrl, type Project } from '@/lib/public-content';

export function ProjectCard({ project, cta }: { project: Project; cta: string }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const detailsId = useId();
  const expanded = hovered || pinned || focused;
  const url = safeUrl(project.url);

  return (
    <article
      className={`project project-reveal ${expanded ? 'is-expanded' : ''}`}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="project-image">
        <span className="category">{project.category}</span>
        {project.image ? (
          <Photo photo={project.image} />
        ) : (
          <div className="project-placeholder">
            <h3>{project.title}</h3>
          </div>
        )}
      </div>
      <div className="project-heading">
        <h3>{project.title}</h3>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={`Detalles de ${project.title}`}
          onClick={() => {
            setPinned(!pinned);
            setFocused(false);
            setHovered(false);
          }}
        >
          <FiChevronDown aria-hidden="true" />
        </button>
      </div>
      <div className="project-reveal-grid" inert={!expanded}>
        <div id={detailsId} className="project-reveal-body">
          <div className="project-details">
            <p>{project.description || project.category}</p>
            {project.testimonial && (
              <blockquote>
                <p>“{project.testimonial}”</p>
                <footer>{project.author}</footer>
              </blockquote>
            )}
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {cta}
                <FiArrowRight aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
