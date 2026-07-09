import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'];

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSpaceDto) {
    return this.prisma.space.create({ data: dto });
  }

  findAll() {
    return this.prisma.space.findMany({ where: { status: true } });
  }

  async findOne(id: number) {
    const space = await this.prisma.space.findUnique({ where: { id } });
    if (!space) throw new NotFoundException('Espacio no encontrado');
    return space;
  }

  // Devuelve solo startTime/endTime de las reservas activas de ese espacio
  // en el día indicado (sin datos del usuario). El frontend usa esto para
  // deshabilitar horarios ya ocupados en el selector de reserva.
  async getReservationsForDate(id: number, date: string) {
    await this.findOne(id);

    if (!date || Number.isNaN(Date.parse(date))) {
      throw new BadRequestException('date debe tener formato YYYY-MM-DD');
    }

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    return this.prisma.reservation.findMany({
      where: {
        spaceId: id,
        status: { in: ACTIVE_STATUSES },
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
      select: { startTime: true, endTime: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async update(id: number, dto: UpdateSpaceDto) {
    await this.findOne(id);
    return this.prisma.space.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.space.update({ where: { id }, data: { status: false } });
  }
}
