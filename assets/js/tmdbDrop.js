var icons = {
    loading: "data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3Bpbm5lciIgd2lkdGg9IjY1cHgiIGhlaWdodD0iNjVweCIgdmlld0JveD0iMCAwIDY2IDY2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxzdHlsZT4KICAgIDwhW0NEQVRBWwogICAgICBAa2V5ZnJhbWVzIHJvdGF0b3IgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH0KICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMjcwZGVnKTsgfQogICAgICB9CiAgICAgIAogICAgICBAa2V5ZnJhbWVzIGNvbG9ycyB7CiAgICAgICAgMCUgeyBzdHJva2U6ICM0Mjg1RjQ7IH0KICAgICAgICAyNSUgeyBzdHJva2U6ICNERTNFMzU7IH0KICAgICAgICA1MCUgeyBzdHJva2U6ICNGN0MyMjM7IH0KICAgICAgICA3NSUgeyBzdHJva2U6ICMxQjlBNTk7IH0KICAgICAgICAxMDAlIHsgc3Ryb2tlOiAjNDI4NUY0OyB9CiAgICAgIH0KICAgICAgCiAgICAgIEBrZXlmcmFtZXMgZGFzaCB7CiAgICAgICAgMCUgeyBzdHJva2UtZGFzaG9mZnNldDogMTg3OyB9CiAgICAgICAgNTAlIHsKICAgICAgICAgIHN0cm9rZS1kYXNob2Zmc2V0OiA0Ni43NTsKICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDEzNWRlZyk7CiAgICAgICAgfQogICAgICAgIDEwMCUgewogICAgICAgICAgc3Ryb2tlLWRhc2hvZmZzZXQ6IDE4NzsKICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDQ1MGRlZyk7CiAgICAgICAgfQogICAgICB9CiAgICAgIAogICAgICAuc3Bpbm5lciB7CiAgICAgICAgYW5pbWF0aW9uOiByb3RhdG9yIDEuNHMgbGluZWFyIGluZmluaXRlOwogICAgICB9CgogICAgICAucGF0aCB7CiAgICAgICAgc3Ryb2tlLWRhc2hhcnJheTogMTg3OwogICAgICAgIHN0cm9rZS1kYXNob2Zmc2V0OiAwOwogICAgICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlcjsKICAgICAgICBhbmltYXRpb246CiAgICAgICAgICBkYXNoIDEuNHMgZWFzZS1pbi1vdXQgaW5maW5pdGUsCiAgICAgICAgICBjb2xvcnMgNS42cyBlYXNlLWluLW91dCBpbmZpbml0ZTsKICAgICAgfQogICAgXV0+CiAgPC9zdHlsZT4KICA8Y2lyY2xlIGNsYXNzPSJwYXRoIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgY3g9IjMzIiBjeT0iMzMiIHI9IjMwIj48L2NpcmNsZT4KPC9zdmc+Cg==",
    leftArrow: "data:Image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAACXBIWXMAAAsTAAALEwEAmpwYAAA4JGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwNjcgNzkuMTU3NzQ3LCAyMDE1LzAzLzMwLTIzOjQwOjQyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTgtMTAtMTBUMDA6NTA6NDQrMDM6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOC0xMC0xMFQwMDo1Mjo1MyswMzowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTgtMTAtMTBUMDA6NTI6NTMrMDM6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjE8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6OWUyNGUyNGEtMDIxZC0yYTQ0LWFjMzMtZWYzYjQ4ZDk4MjNkPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjllMjRlMjRhLTAyMWQtMmE0NC1hYzMzLWVmM2I0OGQ5ODIzZDwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjllMjRlMjRhLTAyMWQtMmE0NC1hYzMzLWVmM2I0OGQ5ODIzZDwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmNyZWF0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDo5ZTI0ZTI0YS0wMjFkLTJhNDQtYWMzMy1lZjNiNDhkOTgyM2Q8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMTAtMTBUMDA6NTA6NDQrMDM6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT42NTUzNTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NjQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+NjQ8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PqGzu+QAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAQ9JREFUeNrUmdkRhCAUBCcA8jEmIyMQAmP/tvZSgXfYqwF0V6HAm1HX0Wt7atk3SeoXr2IEalFT27ebBGpRU1dX27cbBJ74rlZLusA7Pn0JPvHJAt/4VIFf+ESB3/g0gSN8ksAxPkXgDJ8gcI4PF7jCBwtc40MFRvCBAmP4MIFRfJDAOD5EYAYfIDCHdxeYxTsLzONdBVbwjgJreDeBVbyTwDreRcCCdxCw4c0CVrxRwI43Cbzg+yr+vwVuXwLARwj4DQEbEWArBhxGgOMYcCEBXMkAl1LAtRwwmABGM8BwChjPAQEFIKIBhFSAmA4QVAKiWkBYDYjrAYUFoLIBlFaA2g5QXAKqW0B5PVPfPwYAWmCigVCrxWkAAAAASUVORK5CYII=",
};

// Utility function to create elements with optional reference and content
Element.prototype.createE = function (tag, referance, content) {
  var element = document.createElement(tag);

  if (referance && referance[0] === "#") {
    element.id = referance.replace("#", "");
  } else if (referance) {
    element.classList = referance;
  }

  if (content && tag.toUpperCase() === "IMG") {
    element.src = content;
  } else if (content) {
    element.innerHTML = content;
  }

  if (!this.doctype) {
    var final = this.appendChild(element);
  }

  return final || element;
};

var loop, columns, delay;

var loading = document.body.createE("div", "container");
loading.style.background = "url(" + icons.loading + ") no-repeat center";
loading.style.backgroundSize = "48px";

var prev = document.body.createE("div", "#prev");
prev.setAttribute("onclick", "nextPrev(-1)");

var next = document.body.createE("div", "#next");
next.setAttribute("onclick", "nextPrev(1)");

var dots = document.body.createE("div", "#dots");

// Fetch movie data from movies.php
fetch("tmdbDrop.php")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    makeSlideshow(data);
  })
  .catch((error) => {
    console.error("Error fetching media:", error);
  });

function makeSlideshow(input, n = input.length) {
  init(input, 12, 15000); // Initialize with default columns and delay
  downloadImage(input, n);

  async function downloadImage(input) {
    for (var i = 0; i < n; i++) {
      await new Promise((resolve, reject) => {
        var image = new Image();
        image.src = input[i].image;
        image.onload = () => {
          createDot(input[i], i);
          resolve();
        };
        image.onerror = () => {
          createDot(input[i], i, true);
          resolve();
        };
      });
    }
  }
}

function init(_input, _columns = 12, _delay = 15000) {
  input = _input;
  columns = _columns;
  delay = _delay;
}

function createDot(slide, index, err) {
  if (err) {
    slide.image = "404.png";
  }
  var dotContainer = dots.createE("div", "dot-container");
  var dot = dotContainer.createE("div", "dot");
  dot.style.backgroundImage = "url(" + slide.artWork + ")";
  dot.setAttribute("onclick", "showSlide(" + index + ")");

  if (index === 0) {
    slideshow(slide);
  }
}

function slideshow(slide) {
  var firstSlide = makeLayout(slide);
  visibleBox(firstSlide.boxes);
  document.getElementsByClassName("dot")[0].classList.add("active");

  loop = setTimeout(() => {
    nextPrev(1);
  }, delay);
}

function showSlide(n) {
  clearTimeout(loop);
  makeAnimation(input[n]);
  var allDots = document.getElementsByClassName("dot");
  for (var i = 0; i < allDots.length; i++) {
    allDots[i].classList.remove("active");
  }
  var dot = allDots[n];
  dot.classList.add("active");
  loop = setTimeout(() => {
    nextPrev(1);
  }, delay);
}

function nextPrev(n) {
  clearTimeout(loop);
  var allDots = document.getElementsByClassName("dot");
  for (var i = 0; i < allDots.length; i++) {
    var target = n + i;
    if (allDots[i].classList.contains("active")) {
      allDots[i].classList.remove("active");
      if (target >= allDots.length) {
        target = 0;
      } else if (target < 0) {
        target = allDots.length - 1;
      }
      makeAnimation(input[target]);
      allDots[target].classList.add("active");
      break;
    }
  }
  loop = setTimeout(() => {
    nextPrev(1);
  }, delay);
}

function makeAnimation(slide) {
  removePrevious();
  var animation = [
    "pushUpDown(slide)",
    "pullUpDown(slide)",
    "pullDown(slide)",
    "pullUp(slide)",
    "boxEmerge(slide)",
    "boxEmergeReverse(slide)",
    "pushUp(slide)",
    "pushDown(slide)",
    "fade(slide)",
    "slideCol(slide)",
    "slideColReverse(slide)",
    'slideIn(slide, "Left")',
    'slideIn(slide, "Right")',
    'slideIn(slide, "Up")',
    'slideIn(slide, "Down")',
    'slideOut(slide, "Left")',
    'slideOut(slide, "Right")',
    'slideOut(slide, "Up")',
    'slideOut(slide, "Down")',
    'slideWith(slide, "Left")',
    'slideWith(slide, "Right")',
    'slideWith(slide, "Up")',
    'slideWith(slide, "Down")',
  ];

  var x = Math.floor(Math.random() * animation.length);
  eval(animation[x]);
}

function makeLayout(slide, out) {
  var oldContainer = document.getElementsByClassName("container");
  oldContainer = oldContainer[oldContainer.length - 1];

  if (out) {
    var oldVertical = oldContainer.getElementsByClassName("col");
    var oldBoxes = [];
    for (var i = 0; i < oldVertical.length; i++) {
      oldVertical[i].className = "col";
      var oldRows = oldVertical[i].getElementsByClassName("row");
      var oldOneCol = [];
      for (var j = 0; j < oldRows.length; j++) {
        var content = oldRows[j].getElementsByClassName("content")[0];
        content.className = "content visible";
        oldOneCol.push(content);
      }
      oldBoxes.push(oldOneCol);
    }
    oldContainer.style.zIndex = 1;
  }

  var container = document.body.createE("div", "container");
  var boxes = [];
  var vertical = [];

  for (var i = 0; i < columns; i++) {
    vertical.push(container.createE("div", "col"));
  }

  var rows = Math.floor(window.innerHeight / vertical[0].offsetWidth);

  for (var i = 0; i < vertical.length; i++) {
    var horizontal = [];
    for (var j = 0; j < rows; j++) {
      horizontal.push(vertical[i].createE("div", "row"));
    }
    var oneCol = [];
    for (var j = 0; j < horizontal.length; j++) {
      oneCol.push(horizontal[j].createE("div", "content"));
    }
    boxes.push(oneCol);
    createBackground(oneCol, slide.image);
  }

  function createBackground(slices, image) {
    for (var i = 0; i < slices.length; i++) {
      slices[i].style.backgroundImage = "url(" + image + ")";
      positionBackground(slices[i]);
    }
  }

  createSlideHeader(
    slide.artWork,
    slide.logo,
    slide.title,
    slide.date,
    slide.subtitle,
    slide.url
  );

  if (out) {
    visibleBox(boxes);
  }

  return {
    vertical: oldVertical || vertical,
    boxes: oldBoxes || boxes,
    container: container,
    oldContainer: oldContainer,
  };
}

function positionBackground(slice) {
  slice.style.backgroundPosition =
    -slice.offsetLeft + "px " + -slice.offsetTop + "px";
  slice.style.backgroundSize = window.innerWidth + "px";
}

function visibleBox(boxes) {
  if (boxes[0][0]) {
    for (var i = 0; i < boxes.length; i++) {
      for (var j = 0; j < boxes[i].length; j++) {
        boxes[i][j].classList.add("visible");
      }
    }
  } else {
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].classList.add("visible");
    }
  }
}

function removePrevious() {
  var containers = document.getElementsByClassName("container");
  if (containers.length >= 2) {
    containers[0].remove();
  }

  var slideHeader = document.querySelectorAll(".slide-header");
  if (slideHeader.length >= 2) {
    for (var i = 0; i < slideHeader.length; i++) {
      slideHeader[i].remove();
    }
  } else if (slideHeader.length >= 1) {
    slideHeader[0].classList.add("out");
    slideHeader[0].classList.remove("in");
    setTimeout(() => {
      slideHeader[0].remove();
    }, 500);
  }
}

async function timeline(boxes, className, colDelay, rowDelay) {
  colsAwait(boxes);
  async function colsAwait(boxes) {
    for (var i = 0; i < boxes.length; i++) {
      if (colDelay)
        await new Promise((resolve) => setTimeout(resolve, colDelay));
      boxesAwait(boxes[i]);
    }
  }
  async function boxesAwait(boxes) {
    for (var i = 0; i < boxes.length; i++) {
      if (rowDelay)
        await new Promise((resolve) => setTimeout(resolve, rowDelay));
      boxes[i].classList.add(className);
    }
  }
}

Array.prototype.boxReverse = function () {
  this.reverse();
  for (var i = 0; i < this.length; i++) {
    this[i].reverse();
  }
  return this;
};

window.addEventListener("resize", () => {
  var slices = document.querySelectorAll(".content");
  for (var i = slices.length - 1; i >= 0; i--) {
    positionBackground(slices[i]);
  }
});

function createSlideHeader(artwork, logo, title, date, subtitle, url) {
  // Extract the year from the date
  var year = date.split("-")[0];

  // Create slide header container
  var slideHeader = document.createElement("div");
  slideHeader.classList.add("slide-header");

  // Create header text container
  var headerText = document.createElement("div");
  headerText.classList.add("header-text");
  slideHeader.appendChild(headerText);

  // Create and append logo image within header text (replacing title)
  var logoImage = document.createElement("img");
  logoImage.src = logo;
  logoImage.alt = "Logo";
  logoImage.classList.add("logo");
  headerText.appendChild(logoImage);

  // Create title container element
  var titleContainer = document.createElement("div");
  titleContainer.classList.add("title-container");
  headerText.appendChild(titleContainer);

  // Create a single span element for the title and year
  var titleYearSpan = document.createElement("span");
  titleYearSpan.classList.add("title-year");

  // Set the title text
  titleYearSpan.textContent = title + " ";

  // Create an italic element for the year
  var yearItalic = document.createElement("em");
  yearItalic.textContent = `(${year})`;

  // Append the italic year to the title span
  titleYearSpan.appendChild(yearItalic);

  // Append the span to the container
  titleContainer.appendChild(titleYearSpan);

  // Create and append subtitle element
  var subtitleElement = document.createElement("div");
  subtitleElement.classList.add("subtitle");
  subtitleElement.innerHTML = subtitle;
  headerText.appendChild(subtitleElement);

  // Set CSS styles for positioning
  //slideHeader.style.position = "absolute";
  //slideHeader.style.top = "30%";
  //slideHeader.style.left = "15%";
  //slideHeader.style.transform = "translate(-50%, -50%)"; // Center vertically

  // Append artwork image
  var posterImage = document.createElement("img");
  posterImage.src = artwork;
  posterImage.alt = "Poster";
  posterImage.classList.add("poster");
  slideHeader.appendChild(posterImage);

  // Append slide header to document body
  document.body.appendChild(slideHeader);

  // Add animation or additional classes
  slideHeader.classList.add("in");
}

// Animation functions
async function pushUpDown(input) {
  var layout = makeLayout(input);
  var cols = layout.vertical;
  for (var i = 0; i < cols.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    visibleBox(layout.boxes[i]);
    cols[i].classList.add("pushUpDown");
  }
}

async function pullUpDown(input) {
  var layout = makeLayout(input, true);
  var cols = layout.vertical;
  for (var i = 0; i < cols.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    visibleBox(layout.boxes[i]);
    cols[i].classList.add("pullUpDown");
  }
}

async function pullDown(input) {
  var layout = makeLayout(input, true);
  var cols = layout.vertical;
  for (var i = 0; i < cols.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 75));
    cols[i].classList.add("pullDown");
  }
}

async function pullUp(input) {
  var layout = makeLayout(input, true);
  var cols = layout.vertical;
  for (var i = 0; i < cols.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 75));
    cols[i].classList.add("pullUp");
  }
}

async function boxShrink(input) {
  var layout = makeLayout(input, true);
  var boxes = layout.boxes;
  timeline(boxes, "boxShrink", 75, 75);
}

async function boxShrinkReverse(input) {
  var layout = makeLayout(input, true);
  var boxes = layout.boxes;
  boxes.boxReverse();
  timeline(boxes, "boxShrink", 75, 75);
}

async function boxEmerge(input) {
  var layout = makeLayout(input);
  var boxes = layout.boxes;
  timeline(boxes, "boxEmerge", 75, 75);
}

async function boxEmergeReverse(input) {
  var layout = makeLayout(input);
  var boxes = layout.boxes;
  boxes.boxReverse();
  timeline(boxes, "boxEmerge", 75, 75);
}

async function slideCol(input) {
  var layout = makeLayout(input);
  var boxes = layout.boxes;
  timeline(boxes, "slideCol", 75);
}

async function slideColReverse(input) {
  var layout = makeLayout(input);
  var boxes = layout.boxes;
  boxes.reverse();
  timeline(boxes, "slideCol", 75);
}

async function pushUp(input) {
  var layout = makeLayout(input);
  var cols = layout.vertical;
  for (var i = 0; i < cols.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 75));
    visibleBox(layout.boxes[i]);
    cols[i].classList.add("pushUp");
  }
}

async function pushDown(input) {
  var layout = makeLayout(input);
  var cols = layout.vertical;
  for (var i = 0; i < cols.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 75));
    visibleBox(layout.boxes[i]);
    cols[i].classList.add("pushDown");
  }
}

function fade(input) {
  var layout = makeLayout(input);
  var boxes = layout.boxes;
  visibleBox(boxes);
  var container = layout.container;
  container.classList.add("fade");
}

function slideIn(input, direction) {
  var layout = makeLayout(input);
  var boxes = layout.boxes;
  visibleBox(boxes);
  var container = layout.container;
  var oldContainer = layout.oldContainer;
  container.className = "container " + "push" + direction;
  oldContainer.className = "container smaller";
}

function slideOut(input, direction) {
  var layout = makeLayout(input, true);
  var container = layout.container;
  var oldContainer = layout.oldContainer;
  oldContainer.className = "container " + "pull" + direction;
  container.className = "container bigger";
}

function slideWith(input, direction) {
  var layout = makeLayout(input, true);
  var container = layout.container;
  var oldContainer = layout.oldContainer;
  oldContainer.className = "container " + "pull" + direction;
  container.className = "container " + "push" + direction;
}
