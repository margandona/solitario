/**
 * Utilidad para manejar drag and drop en dispositivos táctiles
 */

export interface TouchDragData {
  pileId: string;
  cardIndex: number;
  cardCount: number;
  startX: number;
  startY: number;
}

class TouchDragManager {
  private dragData: TouchDragData | null = null;
  private dragElement: HTMLElement | null = null;
  private ghostElement: HTMLElement | null = null;
  private dropTargets: Map<string, HTMLElement> = new Map();

  startDrag(data: TouchDragData, element: HTMLElement) {
    this.dragData = data;
    this.dragElement = element;
    
    // Crear elemento ghost para seguir el dedo
    this.createGhostElement(element);
  }

  private createGhostElement(original: HTMLElement) {
    const ghost = original.cloneNode(true) as HTMLElement;
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.7';
    ghost.style.zIndex = '10000';
    ghost.style.transform = 'scale(1.1)';
    ghost.style.transition = 'none';
    
    document.body.appendChild(ghost);
    this.ghostElement = ghost;
  }

  updateGhostPosition(x: number, y: number) {
    if (this.ghostElement) {
      // Centrar el ghost en el dedo
      const rect = this.dragElement?.getBoundingClientRect();
      if (rect) {
        this.ghostElement.style.left = `${x - rect.width / 2}px`;
        this.ghostElement.style.top = `${y - rect.height / 2}px`;
      }
    }
  }

  registerDropTarget(pileId: string, element: HTMLElement) {
    this.dropTargets.set(pileId, element);
  }

  unregisterDropTarget(pileId: string) {
    this.dropTargets.delete(pileId);
  }

  findDropTarget(x: number, y: number): string | null {
    // Ocultar temporalmente el ghost para hacer elementFromPoint
    if (this.ghostElement) {
      this.ghostElement.style.display = 'none';
    }

    const element = document.elementFromPoint(x, y);
    
    if (this.ghostElement) {
      this.ghostElement.style.display = 'block';
    }

    // Buscar si el elemento está dentro de algún drop target
    for (const [pileId, target] of this.dropTargets.entries()) {
      if (target.contains(element)) {
        return pileId;
      }
    }

    return null;
  }

  endDrag(): { data: TouchDragData | null; targetPileId: string | null } {
    const result = {
      data: this.dragData,
      targetPileId: null as string | null
    };

    // Limpiar ghost element
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }

    this.dragData = null;
    this.dragElement = null;

    return result;
  }

  getDragData(): TouchDragData | null {
    return this.dragData;
  }

  isDragging(): boolean {
    return this.dragData !== null;
  }

  cancelDrag() {
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }
    this.dragData = null;
    this.dragElement = null;
  }
}

// Singleton global
export const touchDragManager = new TouchDragManager();
