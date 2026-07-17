"""Platform-guarded TCP keepalive socket-option builder tests.

These exercise the as-is ``get_keepalive_socket_options`` helper that every
generated SDK copies verbatim. They run cross-OS (Linux/macOS/Windows) via a
dedicated CI matrix job so we prove the per-platform guards hold on real OSes,
not just under monkeypatch.
"""

import socket
from typing import Dict, List, Tuple

import httpx

from core_utilities.shared.http_client import get_keepalive_socket_options


def _opt_dict(opts: List[Tuple[int, int, int]]) -> Dict[Tuple[int, int], int]:
    return {(level, name): value for (level, name, value) in opts}


def test_always_enables_so_keepalive() -> None:
    opts = get_keepalive_socket_options()
    assert (socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1) in opts


def test_linux_all_constants(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    # Linux exposes TCP_KEEPIDLE (not TCP_KEEPALIVE) plus INTVL/CNT.
    monkeypatch.setattr(socket, "TCP_KEEPIDLE", 4, raising=False)
    monkeypatch.delattr(socket, "TCP_KEEPALIVE", raising=False)
    monkeypatch.setattr(socket, "TCP_KEEPINTVL", 5, raising=False)
    monkeypatch.setattr(socket, "TCP_KEEPCNT", 6, raising=False)

    opts = get_keepalive_socket_options(idle=60, intvl=30, cnt=5)
    d = _opt_dict(opts)

    assert d[(socket.SOL_SOCKET, socket.SO_KEEPALIVE)] == 1
    assert d[(socket.IPPROTO_TCP, 4)] == 60  # TCP_KEEPIDLE
    assert d[(socket.IPPROTO_TCP, 5)] == 30  # TCP_KEEPINTVL
    assert d[(socket.IPPROTO_TCP, 6)] == 5  # TCP_KEEPCNT


def test_macos_resolves_idle_to_tcp_keepalive(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    # macOS has no TCP_KEEPIDLE; the idle knob must fall back to TCP_KEEPALIVE.
    monkeypatch.delattr(socket, "TCP_KEEPIDLE", raising=False)
    monkeypatch.setattr(socket, "TCP_KEEPALIVE", 0x10, raising=False)
    monkeypatch.setattr(socket, "TCP_KEEPINTVL", 5, raising=False)
    monkeypatch.setattr(socket, "TCP_KEEPCNT", 6, raising=False)

    opts = get_keepalive_socket_options(idle=42, intvl=30, cnt=5)
    d = _opt_dict(opts)

    # The idle option is present and applied to TCP_KEEPALIVE (not silently skipped,
    # which would leave macOS idle at the ~2h OS default).
    assert d[(socket.IPPROTO_TCP, 0x10)] == 42


def test_old_windows_or_minimal_only_so_keepalive(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    # No TCP_* constants defined at all: must not raise, still enable SO_KEEPALIVE.
    monkeypatch.delattr(socket, "TCP_KEEPIDLE", raising=False)
    monkeypatch.delattr(socket, "TCP_KEEPALIVE", raising=False)
    monkeypatch.delattr(socket, "TCP_KEEPINTVL", raising=False)
    monkeypatch.delattr(socket, "TCP_KEEPCNT", raising=False)

    opts = get_keepalive_socket_options()

    assert opts == [(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)]


def test_httpx_transports_accept_socket_options() -> None:
    """The generated default transport passes these tuples to
    ``httpx.HTTPTransport``/``httpx.AsyncHTTPTransport`` via ``socket_options=``,
    which requires httpx>=0.25. Constructing both transports here proves the kwarg
    is accepted on whichever httpx version is installed (floor and latest in CI)."""
    opts = get_keepalive_socket_options()

    sync_transport = httpx.HTTPTransport(socket_options=opts)
    async_transport = httpx.AsyncHTTPTransport(socket_options=opts)

    assert sync_transport is not None
    assert async_transport is not None


def test_getsockopt_readback_on_real_socket() -> None:
    """Behavioral gate: apply the options to a real socket connected to loopback and
    read them back off the live socket. Proves SO_KEEPALIVE is enabled and the idle
    knob reads back the configured value (not the ~7200s OS default). Pure-Python, no
    root or packet capture required, so it is safe on any CI runner."""
    opts = get_keepalive_socket_options(idle=61, intvl=31, cnt=4)

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("127.0.0.1", 0))
    server.listen(1)
    addr = server.getsockname()

    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    conn = None
    try:
        client.connect(addr)
        conn, _ = server.accept()

        # These setsockopt calls are exactly what httpcore performs with the tuples;
        # each option is platform-guarded so none of them should raise here.
        for level, name, value in opts:
            client.setsockopt(level, name, value)

        # macOS returns a nonzero value (e.g. 8), not exactly 1, when keepalive is on,
        # so assert "enabled" (truthy) rather than == 1.
        assert client.getsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE) != 0

        idle_const = getattr(socket, "TCP_KEEPIDLE", None) or getattr(socket, "TCP_KEEPALIVE", None)
        if idle_const:
            try:
                read_idle = client.getsockopt(socket.IPPROTO_TCP, idle_const)
            except OSError:
                # Some platforms (e.g. Windows) allow setting but not reading the idle
                # knob; the SO_KEEPALIVE assertion above still proves keepalive is on.
                read_idle = None
            if read_idle is not None:
                assert read_idle == 61
    finally:
        if conn is not None:
            conn.close()
        client.close()
        server.close()
