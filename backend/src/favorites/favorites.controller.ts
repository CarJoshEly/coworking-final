import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  add(@Req() req: any, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(req.user.userId, dto);
  }

  @Get()
  findMine(@Req() req: any) {
    return this.favoritesService.findMine(req.user.userId);
  }

  @Delete(':spaceId')
  remove(@Param('spaceId', ParseIntPipe) spaceId: number, @Req() req: any) {
    return this.favoritesService.remove(req.user.userId, spaceId);
  }
}
