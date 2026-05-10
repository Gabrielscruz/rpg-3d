import { Injectable, InternalServerErrorException } from '@nestjs/common';

type YouTubePlaylistItemResponse = {
  nextPageToken?: string;
  items?: Array<{
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
    snippet?: {
      position?: number;
      title?: string;
      channelTitle?: string;
      videoOwnerChannelTitle?: string;
      thumbnails?: {
        default?: { url?: string };
        medium?: { url?: string };
        high?: { url?: string };
      };
    };
  }>;
};

@Injectable()
export class YoutubeService {
  private readonly apiBaseUrl = process.env.APIBASEGOOGLE!;

  async getPlaylistItems(playlistId: string) {
    const apiKey = process.env.YOUTUBE_DATA_API_KEY!;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'YOUTUBE_DATA_API_KEY nao configurada no backend.',
      );
    }

    const items: Array<{
      videoId: string;
      title: string;
      thumbnail: string;
      position: number;
      channelTitle: string;
      publishedAt: string;
    }> = [];

    let pageToken = '';

    do {
      const url = new URL(this.apiBaseUrl);
      url.searchParams.set('part', 'snippet,contentDetails');
      url.searchParams.set('maxResults', '50');
      url.searchParams.set('playlistId', playlistId);
      url.searchParams.set('key', apiKey);

      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(
          `Falha ao consultar YouTube Data API: ${errorText}`,
        );
      }

      const data = (await response.json()) as YouTubePlaylistItemResponse;

      for (const item of data.items || []) {
        const videoId = item.contentDetails?.videoId || '';

        if (!videoId) continue;

        items.push({
          videoId,
          title: item.snippet?.title || 'Sem titulo',
          thumbnail:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.default?.url ||
            '',
          position: item.snippet?.position ?? items.length,
          channelTitle:
            item.snippet?.videoOwnerChannelTitle ||
            item.snippet?.channelTitle ||
            '',
          publishedAt: item.contentDetails?.videoPublishedAt || '',
        });
      }

      pageToken = data.nextPageToken || '';
    } while (pageToken);

    return {
      playlistId,
      total: items.length,
      items,
    };
  }
}