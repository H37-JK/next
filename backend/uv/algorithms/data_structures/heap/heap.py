from __future__ import annotations

from abc import abstractmethod
from collections.abc import Iterable
from typing import Protocol, TypeVar

class Comparable(Protocol):
    @abstractmethod
    def __lt__(self: T, other: T) -> bool:
        pass

    @abstractmethod
    def __gt__(self: T, other: T) -> bool:
        pass

    @abstractmethod
    def __eq__(self: T, other) -> bool:
        pass


T = TypeVar("T", bound = Comparable)

class Heap[T: Comparable]:
    def __init__(self) -> None:
        self.h: list[T] = []
        self.heap_size: int = 0

    def __repr__(self) -> str:
        return str(self.h)

    def parent_index(self, child_index: int) -> int | None:
        if child_index > 0:
            return (child_index - 1) // 2
        return None

    def left_child_index(self, parent_index: int) -> int | None:
        left_child_index = 2 * parent_index + 1
        if left_child_index < self.heap_size:
            return left_child_index
        return None

    def right_child_index(self, parent_index: int) -> int | None:
        right_child_index = 2 * parent_index + 2
        if right_child_index < self.heap_size:
            return right_child_index
        return None

    def max_heapify(self, index: int) -> None:
        if index < self.heap_size:
            violation: int = index
            left_child  = self.left_child_index(index)
            right_child = self.right_child_index(index)
            if left_child is not None and self.h[left_child] > self.h[violation]:
                violation = left_child
