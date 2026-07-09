import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'];

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: number, dto: CreateReservationDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime debe ser posterior a startTime');
    }

    await this.spacesService.findOne(dto.spaceId); // lanza NotFound si no existe

    // Dos rangos se solapan si A.startTime < B.endTime y B.startTime < A.endTime
    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        spaceId: dto.spaceId,
        status: { in: ACTIVE_STATUSES },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw new BadRequestException('El espacio ya está reservado en ese horario');
    }

    return this.prisma.reservation.create({
      data: { ...dto, startTime, endTime, userId },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany({
      include: {
        space: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  findMine(userId: number) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { space: true },
    });
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    return reservation;
  }

  async updateStatus(id: number, userId: number, role: string, dto: UpdateReservationStatusDto) {
    const reservation = await this.findOne(id);

    const isOwner = reservation.userId === userId;
    if (!isOwner && role !== 'ADMIN') {
      throw new ForbiddenException('No puedes modificar esta reserva');
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
    });

    // Notificación automática al dueño de la reserva.
    const space = await this.spacesService.findOne(updated.spaceId);
    const isConfirmed = dto.status === 'CONFIRMED';
    await this.notificationsService.create({
      userId: updated.userId,
      type: isConfirmed ? 'RESERVATION_CONFIRMED' : 'RESERVATION_CANCELLED',
      message: isConfirmed
        ? `Tu reserva en ${space.name} fue confirmada.`
        : `Tu reserva en ${space.name} fue cancelada.`,
      reservationId: updated.id,
    });

    return updated;
  }

  async remove(id: number, userId: number, role: string) {
    const reservation = await this.findOne(id);
    if (reservation.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('No puedes eliminar esta reserva');
    }
    return this.prisma.reservation.delete({ where: { id } });
  }
}
