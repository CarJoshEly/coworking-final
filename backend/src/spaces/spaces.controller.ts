import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Sin guard a nivel de clase: el catálogo de espacios se puede navegar
// sin iniciar sesión (pantalla "Explorar"). Solo las mutaciones (crear,
// editar, eliminar) requieren estar autenticado y ser ADMIN.
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  findAll() {
    return this.spacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.spacesService.findOne(id);
  }

  // Público (igual que el catálogo): solo expone startTime/endTime, sin
  // datos del usuario, para que el frontend calcule horarios ocupados
  // al construir el selector de reserva.
  @Get(':id/reservations')
  getReservationsForDate(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    return this.spacesService.getReservationsForDate(id, date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateSpaceDto) {
    return this.spacesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpaceDto) {
    return this.spacesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.spacesService.remove(id);
  }
}
