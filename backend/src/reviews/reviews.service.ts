import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
  ) {}

  async create(userId: number, spaceId: number, dto: CreateReviewDto) {
    await this.spacesService.findOne(spaceId); // lanza NotFound si no existe

    const existing = await this.prisma.review.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });
    if (existing) {
      throw new BadRequestException('Ya dejaste una reseña para este espacio');
    }

    return this.prisma.review.create({
      data: { ...dto, userId, spaceId },
    });
  }

  findAllForSpace(spaceId: number) {
    return this.prisma.review.findMany({
      where: { spaceId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    return review;
  }

  async update(id: number, userId: number, role: string, dto: UpdateReviewDto) {
    const review = await this.findOne(id);
    if (review.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('No puedes modificar esta reseña');
    }
    return this.prisma.review.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: number, role: string) {
    const review = await this.findOne(id);
    if (review.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('No puedes eliminar esta reseña');
    }
    return this.prisma.review.delete({ where: { id } });
  }
}
