import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
  ) {}

  async add(userId: number, dto: CreateFavoriteDto) {
    await this.spacesService.findOne(dto.spaceId); // lanza NotFound si no existe

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_spaceId: { userId, spaceId: dto.spaceId } },
    });
    if (existing) {
      throw new BadRequestException('Este espacio ya está en tus favoritos');
    }

    // Se incluye "space" en la respuesta para que el frontend pueda
    // mostrar la tarjeta del espacio de inmediato tras marcarlo como
    // favorito, sin depender de un refetch de findMine().
    return this.prisma.favorite.create({
      data: { userId, spaceId: dto.spaceId },
      include: { space: true },
    });
  }

  findMine(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { space: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: number, spaceId: number) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });
    if (!existing) throw new NotFoundException('No tienes este espacio en favoritos');

    return this.prisma.favorite.delete({
      where: { userId_spaceId: { userId, spaceId } },
    });
  }
}
