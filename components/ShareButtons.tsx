'use client';

import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from 'react-share';
import {
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
  EmailIcon,
} from 'react-share';

interface ShareButtonsProps {
  url: string;      // URL completa de la página del reporte
  title: string;    // Título para compartir (ej: "Reporte de Mascota Perdida: Luna")
  description?: string; // Descripción opcional para algunas plataformas
}

const ICON_SIZE = 36;

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <FacebookShareButton url={url} quote={title} hashtag="#AdoptMeTucuman">
        <FacebookIcon size={ICON_SIZE} round />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title} hashtags={['AdoptMeTucuman', 'MascotaPerdida']}>
        <TwitterIcon size={ICON_SIZE} round />
      </TwitterShareButton>

      <WhatsappShareButton url={url} title={title} separator=": ">
        <WhatsappIcon size={ICON_SIZE} round />
      </WhatsappShareButton>

      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={ICON_SIZE} round />
      </TelegramShareButton>

      <LinkedinShareButton url={url} title={title} summary={description}>
        <LinkedinIcon size={ICON_SIZE} round />
      </LinkedinShareButton>

      <EmailShareButton url={url} subject={title} body={description || title}>
        <EmailIcon size={ICON_SIZE} round />
      </EmailShareButton>
    </div>
  );
} 