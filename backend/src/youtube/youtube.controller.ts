import { Controller, Get, Param } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('api/youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('playlists/:playlistId/items')
  getPlaylistItems(@Param('playlistId') playlistId: string) {
    return this.youtubeService.getPlaylistItems(playlistId);
  }
}